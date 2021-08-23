const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create ( req, res ) {
  const newDish = {
    "id": nextId(),
    "name": res.locals.name,
    "description": res.locals.description,
    "price": res.locals.price,
    "image_url": res.locals.image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function hasName ( req, res, next ) {
  const { data: {name} = "" } = req.body;
  
  if(name && name.length !== 0){
    res.locals.name = name;
    return next();
  }
  next ({ 
    status: 400, 
    message: "Dish must include a name"
  });
}

function hasDescription ( req, res, next ) {
  const { data: {description} = "" } = req.body;
  
  if(description && description.length !== 0){
    res.locals.description = description;
    return next();
  }
  next ({ 
    status: 400, 
    message: "Dish must include a description"
  });
}

function hasPrice ( req, res, next ) {
  const { data: {price} = 0 } = req.body;
  
  if(!price){
    next ({
      status: 400,
      message: "Dish must include a price"
    })
  }
  else if (!Number.isInteger(price) || price <= 0){
    next ({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    })
  }
  else{
    res.locals.price = price;
    return next();
  }
}

function hasImage ( req, res, next ) {
  const { data: {image_url} = "" } = req.body;
  
  if(image_url){
    res.locals.image_url = image_url;
    return next();
  }
    next ({
    status: 400,
    message: "Dish must include a image_url"
  }); 
}

function list ( req, res ) {
  res.json({ data: dishes });
}

function dishExists(request, response, next) {
  const { dishId } = request.params;
  let foundDish;
  for(let i = 0; i < dishes.length; i++){
    if(dishes[i].id === dishId){
      foundDish = dishes[i];
    }
  }
  if (foundDish) {
    response.locals.dish = foundDish;
    return next()
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function idCheck ( req, res, next ) {
  const { data: {id} = 0 } = req.body;
  const dishId = res.locals.dish.id;
  
  if(id === dishId || !id){
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  });
}

function read ( req, res ) {
  const dish = res.locals.dish;
  res.json({ data: dish });
}

function update ( req, res ) {
  let dish = res.locals.dish;
  dish.name = res.locals.name,
  dish.description = res.locals.description,
  dish.price = res.locals.price,
  dish.image_url = res.locals.image_url,
  res.json({ data: dish })
}

module.exports = {
  create: [hasName, hasDescription, hasImage, hasPrice, create],
  list,
  read: [dishExists, read],
  update: [dishExists, idCheck, hasName, hasDescription, hasImage, hasPrice, update],
}
