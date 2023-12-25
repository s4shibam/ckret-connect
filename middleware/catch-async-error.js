export const catchAsyncError = (routeController) => async (req, res, next) => {
  Promise.resolve(routeController(req, res, next)).catch(next);
};
