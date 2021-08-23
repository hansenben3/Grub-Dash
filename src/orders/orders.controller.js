const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function create ( req, res ) {
  const newOrder = {
    "id" : nextId(),
    "deliverTo": res.locals.deliverTo,
    "mobileNumber": res.locals.mobileNumber,
    "status": "delivered",
    "dishes": res.locals.dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function hasDelivery ( req, res, next ) {
  const { data: {deliverTo} = "" } = req.body;
  
  if(deliverTo && deliverTo.length !== 0){
    res.locals.deliverTo = deliverTo;
    return next();
  }
  next ({ 
    status: 400, 
    message: "Order must include a deliverTo"
  });
}

function hasMobile ( req, res, next ) {
  const { data: {mobileNumber} = "" } = req.body;
  
  if(mobileNumber && mobileNumber.length !== 0){
    res.locals.mobileNumber = mobileNumber;
    return next();
  }
  next ({ 
    status: 400, 
    message: "Order must include a mobileNumber"
  });
}

function hasDishes ( req, res, next ) {
  const { data: {dishes} = [] } = req.body;
  
  if(!dishes){
    next ({
      status: 400,
      message: "Order must include a dish"
    })
  }
  if ( dishes.length === 0 ){
    next ({
      status: 400,
      message: "Order must include at least one dish"
    });
  }
  if( Array.isArray(dishes)) {
    res.locals.dishes = dishes;
    return next();
  }
  else{
    next ({
      status: 400,
      message: "Order must include at least one dish"
    });
  }
}

function hasQuantity ( req, res, next ) {
  const dishes = res.locals.dishes;
  const check = [];
  for(let i = 0; i < dishes.length; i++){
    if (dishes[i].quantity !== undefined && dishes[i].quantity > 0 && Number.isInteger(dishes[i].quantity)){
      check.push(i);
    }
    else{
      next ({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`
  }); 
    }
  }
  if (check.length === dishes.length){
    return next();
  }
  else{
    next ({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`
  }); 
  }
}

function hasStatus ( req, res, next ) {
  const { data: {status} = "" } = req.body;
  
  if(status === undefined || status.length === 0){
    next ({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    });
  }
  if(status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered"){
    if(status === "delivered"){
    next ({
      status: 400,
      message: "A delivered order cannot be changed"
    });
  }
  else{
    return next();
  }
  }
  else {
         next ({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    });
  }
}

function list ( req, res ) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  let foundOrder;
  for(let i = 0; i < orders.length; i++){
    if(orders[i].id === orderId){
      foundOrder = orders[i];
    }
  }
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next()
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function idCheck ( req, res, next ) {
  const { data: {id} = 0 } = req.body;
  const orderId = res.locals.order.id;
  
  if(id === orderId || !id){
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
  });
}

function read ( req, res ) {
  const order = res.locals.order;
  res.json({ data: order });
}

function update ( req, res ) {
  let order = res.locals.order;
  order.deliverTo = res.locals.deliverTo,
  order.mobileNumber = res.locals.mobileNumber,
  order.dishes = res.locals.dishes,
  res.json({ data: order })
}

function destroy ( req, res) {
  const order = res.locals.order;
  const deletedOrder = orders.splice(order, 1);
  res.status(204).json({ data: deletedOrder})
}

function deleteCheck ( req, res, next ) {
  const order = res.locals.order;
  
  if(order.status !== "pending"){
    next({
    status: 400,
    message: "An order cannot be deleted unless it is pending"
  });
  }
  else{
    return next();
  }
}

module.exports = {
  create: [hasDelivery, hasMobile, hasDishes, hasQuantity, create],
  list,
  read: [orderExists, read],
  update: [orderExists, idCheck, hasDelivery, hasMobile, hasDishes, hasQuantity, hasStatus, update],
  delete: [orderExists, deleteCheck, destroy]
}


// TODO: Implement the /orders handlers needed to make the tests pass
