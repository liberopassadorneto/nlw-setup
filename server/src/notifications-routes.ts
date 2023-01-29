import { FastifyInstance } from 'fastify';
import WebPush from 'web-push';
import { z } from 'zod';

const publicKey =
  'BNcyaEuA6oLtWzDxC3Grn2Ia6jKyBPoz1h--A7lI0zTbZ7It-awU3mTk7g7flvyNyGoXQesqV9onzxghXHzjOxs';
const privateKey = 'oADKu_QZ9P9izHLf8B0YOpbdBOg9kdLrBnJOCB8-65Y';

WebPush.setVapidDetails('http://localhost:3333', publicKey, privateKey);

export async function notificationRoutes(app: FastifyInstance) {
  app.get('/push/publicKey', () => {
    return { publicKey };
  });

  app.post('/push/register', (request, reply) => {
    // console.log(request.body);

    return reply.status(201).send();
  });

  app.post('/push/send', async (request, reply) => {
    const sendPushBody = z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    });

    const { subscription } = sendPushBody.parse(request.body);

    setTimeout(() => {
      WebPush.sendNotification(subscription, 'HELLO BACKEND');
    }, 5000);

    return reply.status(201).send();
  });
}
