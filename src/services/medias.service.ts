import { CreateMediaDto } from '@dtos/medias.dto';
import { HttpException } from '@exceptions/HttpException';
import { Media } from '@interfaces/medias.interface';
import { Medias } from '@models/medias.model';
import { isEmpty } from '@utils/util';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';

class MediaService {
  public async formatMedia(mediaData) {
    const media = {
      ...mediaData,
      format: JSON.parse(mediaData.format),
    };

    return media;
  }

  public async findAllMedia(): Promise<Media[]> {
    const medias: Media[] = await Medias.query().select().from('medias');
    return await Promise.all(medias.map(async media => this.formatMedia(media)));
  }

  public async findMediaById(mediaId: number): Promise<Media> {
    const findMedia: Media = await Medias.query().findById(mediaId);
    if (!findMedia) throw new HttpException(409, 'MEDIA_NOT_FOUND');

    return this.formatMedia(findMedia);
  }

  public async createMedia(mediaData: CreateMediaDto, userLogged: any): Promise<Media> {
    if (isEmpty(mediaData)) throw new HttpException(400, 'EMPTY_DATA');
    if (mediaData.subtype == 'images') {
      const uuid = uuidv4();
      const path = `src/public/medias/${mediaData.type}/${mediaData.subtype}/${uuid}.jpg`;
      const url = `medias/${mediaData.type}/${mediaData.subtype}/${uuid}.jpg`;
      const imgData = mediaData.fileBase64;
      const base64Data = imgData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      const format = JSON.stringify(mediaData.format);
      fs.writeFileSync(path, base64Data, { encoding: 'base64' });
      mediaData.format.map(async formatImage => {
        const dimensions = formatImage.size.split('x');
        sharp(path)
          .resize(parseInt(dimensions[0]), parseInt(dimensions[1]), {
            fit: 'cover',
          })
          .png({ quality: 100 })
          .toFile(`src/public/medias/${mediaData.type}/${mediaData.subtype}/${uuid}-${formatImage.size}.jpg`)
          .then(() => {});
      });

      const createMediaData: Media = await Medias.query()
        .insert({
          name: mediaData.name,
          type: mediaData.type,
          url,
          format,
          subtype: mediaData.subtype,
          file_type: mediaData.file_type,
          created_at: new Date(),
          created_by: userLogged.id,
        })
        .into('medias');
      return this.formatMedia(createMediaData);
    } else {
      const uuid = uuidv4();
      const path = `src/public/medias/${mediaData.type}/${mediaData.subtype}/${uuid}.pdf`;
      const url = `medias/${mediaData.type}/${mediaData.subtype}/${uuid}.pdf`;
      const fileData = mediaData.fileBase64;
      const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      const format = JSON.stringify(mediaData.format);
      fs.writeFileSync(path, base64Data, { encoding: 'base64' });

      const createMediaData: Media = await Medias.query()
        .insert({
          name: mediaData.name,
          type: mediaData.type,
          url,
          format,
          subtype: mediaData.subtype,
          file_type: mediaData.file_type,
          created_at: new Date(),
          created_by: userLogged.id,
        })
        .into('medias');
      return this.formatMedia(createMediaData);
    }
  }

  public async updateMedia(mediaId: number, mediaData: Media, userLogged: any): Promise<Media> {
    if (isEmpty(mediaData)) throw new HttpException(400, 'EMPTY_DATA');

    const findMedia: Media[] = await Medias.query().select().from('medias').where('id', '=', mediaId);
    if (!findMedia) throw new HttpException(409, 'MEDIA_NOT_FOUND');
    await Medias.query().update({ name: mediaData.name, updated_at: new Date(), updated_by: userLogged.id }).where('id', '=', mediaId).into('medias');

    const updateMediaData: Media = await Medias.query().select().from('medias').where('id', '=', mediaId).first();
    return this.formatMedia(updateMediaData);
  }

  public async removeExtension(url: string): Promise<string> {
    const extension = url.split('.').pop();
    const urlWithoutExtension = url.replace(`.${extension}`, '');
    return urlWithoutExtension;
  }

  public async deleteMedia(mediaId: number): Promise<Media> {
    const findMedia: Media = await Medias.query().select().from('medias').where('id', '=', mediaId).first();
    if (!findMedia) throw new HttpException(409, 'MEDIA_NOT_FOUND');

    const subtype = findMedia.subtype;

    if (subtype == 'images') {
      fs.unlinkSync(`src/public/${findMedia.url}`);
      const format = JSON.parse(findMedia.format);
      format.map(async formatImage => {
        const urlWithoutExtension = await this.removeExtension(findMedia.url);
        fs.unlinkSync(`src/public/${urlWithoutExtension}-${formatImage.size}.${findMedia.file_type}`);
      });
    } else {
      fs.unlinkSync(`src/public/${findMedia.url}`);
    }

    await Medias.query().delete().where('id', '=', mediaId).into('medias');
    return this.formatMedia(findMedia);
  }
}

export default MediaService;
