import { NextApiRequest, NextApiResponse } from 'next';
import { client, Comment } from 'prismas';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { method, body } = req;
  if (method !== 'POST') throw new Error('Method not allowed');

  const { comment, classId }: { comment: Comment; classId: string } = JSON.parse(body);
  await client.comment.create({
    data: {
      class: { connect: { id: classId } },
      user: { connect: { email: session.user.email } },
      difficulty: comment.difficulty,
      rating: comment.rating,
      text: comment.text,
      recommend: comment.recommend,
    },
  });

  await client.classAggregations.upsert({
    where: { classId },
    update: {
      classId,
      class: { connect: { id: classId } },
      numRatings: { increment: 1 },
      totalFive: { increment: comment.rating === 5 ? 1 : 0 },
      totalFour: { increment: comment.rating === 4 ? 1 : 0 },
      totalThree: { increment: comment.rating === 3 ? 1 : 0 },
      totalTwo: { increment: comment.rating === 2 ? 1 : 0 },
      totalOne: { increment: comment.rating === 1 ? 1 : 0 },
      rating: { increment: comment.rating },
      wouldRecommend: { increment: comment.recommend ? 1 : 0 },
      difficulty: { increment: comment.difficulty },
    },
    create: {
      classId,
      class: { connect: { id: classId } },
      numRatings: 1,
      totalFive: comment.rating === 5 ? 1 : 0,
      totalFour: comment.rating === 4 ? 1 : 0,
      totalThree: comment.rating === 3 ? 1 : 0,
      totalTwo: comment.rating === 2 ? 1 : 0,
      totalOne: comment.rating === 1 ? 1 : 0,
      rating: comment.rating,
      wouldRecommend: comment.recommend ? 1 : 0,
      difficulty: comment.difficulty,
    },
  });

  res.status(200).json({ message: 'success' });
}
