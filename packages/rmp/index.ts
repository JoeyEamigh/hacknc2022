import { GQL_QUERY, GQL_URL } from './src/query';
import { GraphQLClient } from 'graphql-request';
import { client, Prisma } from 'prismas';

const gqlClient = new GraphQLClient(GQL_URL, {
  headers: {
    // Yes, their site uses a token that's just 'test:test' in base64
    Authorization: 'Basic dGVzdDp0ZXN0',
    'Cache-Control': 'no-cache',
  },
});

/**
 * Fetches the data from the Rate My Professor GraphQL endpoint. Includes a
 * delay option to avoid rate limiting.
 * @param school ID used by RMP, just the string 'School-%d' base64 encoded
 * @param professor The name of the professor to search for.
 * @param delay The delay in milliseconds to wait before starting the request.
 * @returns The raw data from the GraphQL endpoint.
 */
export async function fetchProfessorSearchResults(school: string, professor: string, delay: number = 100) {
  await new Promise(resolve => setTimeout(resolve, delay));
  try {
    const variables = {
      query: {
        text: professor,
        schoolID: school,
        fallback: false, // set to false since we only want search results from this school
        departmentID: null,
      },
      schoolID: school,
    };
    return gqlClient.request(GQL_QUERY, variables);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Converts the raw JSON data from the GraphQL endpoint into a Prisma input type.
 * @param data The raw JSON data from the GraphQL endpoint.
 * @returns List of Prisma teacher inputs.
 */
export function convertToPrismaInput(data: any) {
  const school = data.school;
  const teachers: Prisma.TeacherCreateInput[] = data.search.teachers.edges.map((edge: any) => {
    const teacher = edge.node;
    // since rmp never returns none as a teacher name, this won't be undefined
    return {
      rmpId: teacher.legacyId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      department: teacher.department,
      avgRating: teacher.avgRating,
      numRatings: teacher.numRatings,
      wouldTakeAgainPercent: teacher.wouldTakeAgainPercent,
      avgDifficulty: teacher.avgDifficulty,
      school: {
        connect: {
          rmpId: school.id,
        },
      },
    } as Prisma.TeacherCreateInput;
  });
  return teachers;
}

/**
 * Returns the professor if they already exist in the database, otherwise
 * creates a new one from rate my professor data.
 *
 * If not found on rate my professor, a dummy teacher is created so that queries
 * relying on teachers existing won't fail. A dummy teacher can be distinguished
 * from a real one because it will always lack an rmpId.
 * @param schoolId The database ID of the school.
 * @param rmpId The rate my professor ID of the school.
 * @param firstName The first name of the professor.
 * @param lastName The last name of the professor.
 * @returns The data from the database for the professor.
 */
export async function findOrCreateProfessor(schoolId: string, rmpId: string, firstName: string, lastName: string) {
  const teacher = await client.teacher.findFirst({
    where: {
      schoolId,
      lastName,
      firstName,
    },
  });

  if (!!teacher) {
    return teacher;
  }

  const data = await fetchProfessorSearchResults(rmpId, `${firstName} ${lastName}`);
  const teachers = convertToPrismaInput(data);

  if (teachers.length === 0) {
    console.error(`No teachers found for '${firstName} ${lastName}' at school ${schoolId}`);
    return client.teacher.create({
      data: {
        firstName,
        lastName,
        department: '',
        numRatings: 0,
        avgRating: 0,
        avgDifficulty: 0,
        wouldTakeAgainPercent: 0,
        school: { connect: { id: schoolId } },
      },
    });
  }

  // overwrite the school ID with the database ID since it's a faster query due
  // to native uuid support in postgres
  return client.teacher.create({
    data: {
      ...teachers[0],
      firstName: firstName.trim().toLowerCase(),
      lastName: lastName.trim().toLowerCase(),
      school: { connect: { id: schoolId } },
    },
  });
}

/**
 * Finds the professor in the database and returns their data. If the data is
 * older than the maxAge, it will fetch the data from the GraphQL endpoint,
 * updating the database and returning the new data.
 * @param teacherId The database ID of the teacher.
 * @param maxAge The maximum age of the data in the database before it is updated.
 * @returns The data from the database for the professor.
 * @throws If the professor is not found in the database or rate my professor.
 */
export async function findProfessorAndRefresh(teacherId: string, maxAge: number) {
  const teacher = await client.teacher.findUnique({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    throw new Error(`No teacher found with ID ${teacherId}`);
  }

  // this is horrible practice but it doesn't really matter since the worst case
  // scenario is that we fetch the data unnecessarily or it's a bit stale
  const age = Date.now() - teacher.updatedAt.getTime();
  if (age < maxAge) {
    return teacher;
  }

  const data = await fetchProfessorSearchResults(teacher.schoolId, `${teacher.firstName} ${teacher.lastName}`);
  const teachers = convertToPrismaInput(data);

  if (teachers.length === 0) {
    throw new Error(`No teachers found for '${teacher.firstName} ${teacher.lastName}' at school ${teacher.schoolId}`);
  }

  return client.teacher.update({
    where: {
      id: teacherId,
    },
    data: teachers[0],
  });
}
