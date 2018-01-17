module.exports = (req, res, next) => {
  if (!req.session || !req.session.credential || !req.session.credential.token) {
    return res.status(401).send({ message: 'not authenticated' });
  }
  next();
};