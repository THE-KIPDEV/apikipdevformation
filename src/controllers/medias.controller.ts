import { NextFunction, Request, Response } from 'express';
import { CreateMediaDto } from '@dtos/medias.dto';
import { Media } from '@interfaces/medias.interface';
import MediaService from '@services/medias.service';

class MediasController {
  public MediaService = new MediaService();

  public getMedias = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medias = await this.MediaService.findAllMedia();
      res.status(200).json(medias);
    } catch (error) {
      next(error);
    }
  };

  public getMediaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const media = await this.MediaService.findMediaById(id);
      res.status(200).json(media);
    } catch (error) {
      next(error);
    }
  };

  public createMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaData: Media = req.body;
      const createMediaData: Media = await this.MediaService.createMedia(mediaData, req.user);

      res.status(201).json({ data: createMediaData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaId = Number(req.params.id);
      const mediaData: Media = req.body;
      const updateMediaData: Media = await this.MediaService.updateMedia(mediaId, mediaData, req.user);

      res.status(200).json({ data: updateMediaData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaId = Number(req.params.id);
      const deleteMediaData: Media = await this.MediaService.deleteMedia(mediaId);

      res.status(200).json({ data: deleteMediaData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default MediasController;
