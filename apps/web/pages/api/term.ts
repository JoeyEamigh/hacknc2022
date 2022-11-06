import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = new Cookies(req, res);
  const { method, body } = req;

  switch (method) {
    case 'POST':
      const term = JSON.parse(body).term;
      cookies.set('term', term);
      res.status(200).json({ message: 'success' });
      break;
  }
}
