import { Request, Response, NextFunction } from 'express';

export const error_handler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
};
