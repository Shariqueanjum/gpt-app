const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed;
      else if (source === 'params') req.params = parsed;
      
      next();
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: err.issues?.map(e => e.message)
      });
    }
  };
};

module.exports = validate;