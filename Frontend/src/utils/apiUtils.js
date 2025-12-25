// // Api error handler
// export class ApiError extends Error {
//   constructor(error) {
//     super();
//     this.statusCode = error.response?.status || 500;
//     this.message = error.response?.data?.message || 'Something went wrong';
//     this.errors = error.response?.data?.errors || [];
//     this.success = false;
//   }
// }

// // success reponse handler
// export const handleSuccessResponse = (response) => {
//   return response?.data?.data || response?.data;
// };

// // error response handler
// export const handleErrorResponse = (error) => {
//   throw new ApiError(error);
// };

export class ApiError extends Error {
  constructor(error) {
    super();
    this.statusCode = error.response?.status || 500;
    this.message = error.response?.data?.message || 'Something went wrong';
    this.errors = error.response?.data?.errors || [];
    this.success = false;
  }
}

// success response handler
export const handleSuccessResponse = (response) => {
  // 1. Capture the main backend response structure
  const backendResponse = response?.data;

  // 2. Capture the actual payload (User object, Recipe list, etc.)
  const payload = backendResponse?.data;

  // 3. INTELLIGENT MERGE:
  // If the payload is an Object (like User or Recipe), we merge the 'success' flag into it.
  // This satisfies BOTH requirements:
  // - Login/Home get their data properties directly.
  // - ForgotPassword gets the 'success: true' flag it checks for.
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return {
      ...payload,
      success: backendResponse?.success,
      message: backendResponse?.message,
    };
  }

  // 4. If payload is array (rare in your app structure) or primitive, return it directly.
  if (payload !== undefined) {
    return payload;
  }

  // 5. Fallback: If no 'data' field exists, return the whole body
  return backendResponse;
};

// error response handler
export const handleErrorResponse = (error) => {
  throw new ApiError(error);
};