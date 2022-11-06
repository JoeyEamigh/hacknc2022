import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { client } from 'prismas';

export default function SingleClassView({ singleClass }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <main></main>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const singleClass = await client.class.findUnique({
    where: { id: String(context.params.id) },
    include: { subject: true, sections: true },
  });
  singleClass.createdAt = String(singleClass.createdAt) as unknown as Date;
  singleClass.sections.forEach(s => (s.createdAt = String(s.createdAt) as unknown as Date));
  singleClass.subject.createdAt = String(singleClass.subject.createdAt) as unknown as Date;

  return {
    props: { singleClass },
  };
}
