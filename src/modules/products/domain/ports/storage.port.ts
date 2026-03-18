export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface IStoragePort {
  save(file: Express.Multer.File): Promise<string>; // returns public URL or path
  delete(urlOrPath: string): Promise<void>;
}
