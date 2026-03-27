class ErrorHandler extends Error{
    statusCode: Number;
    constructor(message: string | undefined, statusCode: Number){
        super(message);
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}

export default ErrorHandler