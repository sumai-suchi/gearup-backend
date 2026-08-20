import type {Response} from "express"


type TErrorResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  error?: string;
  data?: T;
};

const sendErrorResponse = <T>(res: Response, data: TErrorResponse<T>) => {
  return res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    error: data.error,
    data: data.data ?? null,
  });
};

export default sendErrorResponse;