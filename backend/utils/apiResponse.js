// apiResponse Constants
import { MSG_SUCCESS, MSG_ERROR, STATUS_CODE_200, STATUS_CODE_500} from "../constants/apiResponseConstants.js";

// Success Response
export const SuccessResponse = (res, {success = true, statusCode = STATUS_CODE_200, message = MSG_SUCCESS,  data=null} ) => {
    return res.status(statusCode).json({ success, statusCode, message, data });
}

// Error Response
export const ErrorResponse = (res, {success = false, statusCode = STATUS_CODE_500, message = MSG_ERROR,  data = null}) => {
    return res.status(statusCode).json({ success, statusCode, message, data });
}