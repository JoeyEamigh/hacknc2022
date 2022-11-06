import { NextApiRequest, NextApiResponse } from 'next';
import { client } from 'prismas';
import Cookies from 'cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = new Cookies(req, res);
  const { method, body } = req;

  switch (method) {
    case 'POST':
      const id = JSON.parse(body).id;
      const school = await client.school.findUnique({ where: { id } });
      cookies.set('college', Buffer.from(JSON.stringify({ name: school.name, id }), 'binary').toString('base64'));
      res.status(200).json({ message: 'success' });
      break;
    case 'GET':
      res.json(await client.school.findMany());
      break;
  }
}
