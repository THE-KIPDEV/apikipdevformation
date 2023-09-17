const Mailjet = require('node-mailjet');
import { isEmpty } from '@utils/util';

import { HttpException } from '@exceptions/HttpException';

class MailService {
  public async send(mailData: any): Promise<any> {
    if (isEmpty(mailData)) throw new HttpException(400, 'EMPTY_DATA');
    const mailjet = new Mailjet({
      apiKey: process.env.MJ_APIKEY_PUBLIC,
      apiSecret: process.env.MJ_APIKEY_PRIVATE,
    });

    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'email@sender.com',
            Name: 'Email',
          },
          To: [
            {
              Email: mailData.email,
              Name: `${mailData.firstname} ${mailData.lastname}`,
            },
          ],
          TemplateId: mailData.templateId,
          Subject: mailData.subject,
          Variables: { ...mailData.variables },
          TemplateLanguage: true,
        },
      ],
    });

    request
      .then(result => {
        console.log(result);
        return true;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
  }
}

export default MailService;
