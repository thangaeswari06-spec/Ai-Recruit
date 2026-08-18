export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.profile?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "You don't have permission to perform this action." });
    }
    next();
  };
}

export default checkRole;