
export class ApiError extends Error {
    constructor(error){
        super();
        this.statusCode = error.response?.status || 500;
        this.message = error.response?.data?.message || "Something went wrong";
        this.errors = error.response?.data?.errors || [];
        this.success = false;
    }
}


export const handleSuccessResponse = (response) => {
    return response?.data?.data || response?.data;
};


export const handleErrorResponse = (error) => {
    throw new ApiError(error);
};