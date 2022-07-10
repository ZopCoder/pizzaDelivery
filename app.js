const axios = require('axios');
const _baseUrl = "http://127.0.0.1:8888/";

const fetchPizzaShopNearby = function(endpoint, {pin}) {
    console.log(`Locating pizza shop near your location with pincode: ${pin}`);
    return new Promise((resolve, reject) => {
        // At my first attempt, I was doing the following
        /* 
            const response = axios.get(_baseUrl + endpoint + pin)
            resolve(response.data) 
        */
        // But I was getting "undefined" WHY ?? -> since axios.get is an async call
        // response.data was not available at the time I was resolving
        
        // CORRECT WAY >>
        const response = axios.get(_baseUrl + endpoint + pin)
                        .then(res => res.data[0])
        resolve(response);
    });
}

// Promise for fetching the available pizzas from the store:
// Mock API call "/api/pizzahub/pizza" 
// Fetch available pizzas in the shop

const fetchAvailablePizzas = (endpoint, {shopid, shopname}) => {
    console.log(`Getting List of available pizzas from the shop : ${shopname}...`);
    return new Promise((resolve, reject) => {
        const res = axios.get(_baseUrl + endpoint + shopid)
                    .then(response => response.data)
        resolve(res); 
        
    });
}

// Check if the selected pizza is available in the shop

const getMyPizza = (result, type, name)=>{
    let pizzas = result;
    console.log(`Got the pizzas list`, pizzas);
    let myPizza = pizzas.find((pizza)=>{
        return (pizza.PizzaType.toString().toLowerCase() === type.toLowerCase() && pizza.PizzaName.toString().toLowerCase() === name.toLowerCase());
    });
    return new Promise((resolve,reject) => {
        if(myPizza){
            console.log(`Found my pizza ${myPizza.PizzaName}`);
            resolve(myPizza);
        }
        else {
            console.log(`The pizza is not available`);
            reject(new Error(`Sorry, we do not have the ${type} ${name} for now`));
        }
    });
}

// Now Fetch the Complimentary Beverage
// Mock API call "/api/pizzahub/beverages" 
// Fetch the complimentary beverage with the selected pizza

const fetchBeverage = function(endpoint, {pizzaId}){
    console.log(`Getting Beverages for the pizza ${pizzaId}...`);
    
    // Get the free beverage for the given pizza id
    return new Promise((resolve, reject) => {
        const res = axios.get(_baseUrl + endpoint + pizzaId)
                    .then(response => response.data)
        resolve(res); 
    });
}

// Creation of the order :
// Mock API call "/api/pizzahub/order"
// Create the order

const createOrder = (endpoint, payload) => {
    if (endpoint.includes("api/v1/pizzahub/placeorder")) {
        const { type, name, beverage } = payload;
        console.log("Placing the pizza order with...", payload);
        return new Promise((resolve, reject) => {
            const res = axios.post(_baseUrl + endpoint, {
                                "Pizza": name,
                                "PizzaType": type,
                                "Beverage": beverage
                            }
                        )
                        .then(response => response.data)
            
            resolve(res);
            reject(new Error('Oops! Pizza order could not be completed. Please try again.'))
           
        });
    }
}

// Combine All the Fetches in a Single Place
function fetch(endpoint, payload){
    if(endpoint.includes("api/v1/pizzahub/shops/")) {
        return fetchPizzaShopNearby(endpoint, payload);
    } else if (endpoint.includes("api/v1/pizzahub/allpizzas/")) {
        return fetchAvailablePizzas(endpoint, payload);
    } else if (endpoint.includes("api/v1/pizzahub/beverage/")) {
        return fetchBeverage(endpoint, payload);
    }
}

function orderPizza(pincode,type,name) {
    // Get the Nearby Pizza Shop
    fetch("api/v1/pizzahub/shops/", {pin : pincode})
    // Get all pizzas from the shop
    .then((response) => fetch("api/v1/pizzahub/allpizzas/", {shopid : response.id, shopname : response.Shopname}))
    // Check if my pizza is available
    .then((allpizzas) => getMyPizza(allpizzas, type, name))
    // get the beverage with the selected pizza
    .then((pizza) => fetch("api/v1/pizzahub/beverage/", {pizzaId : pizza.id}))
    // Now create the order
    .then((beverage) => createOrder("api/v1/pizzahub/placeorder",
            {   
                type : type,
                name : name,
                beverage : beverage[0].BeverageName
            })
    )
    .then((result) => {
        console.log(`Your order of "${result[0].PizzaType}" "${result[0].Pizza}" pizza with ${result[0].Beverage} has been placed successfully with Order ID ${result[0].id}.`);
    })
    .catch((error) => {
        console.error(`${error.message}`);
    })
}


// Placing your Pizza Order:
orderPizza(712258, "Veg", "margarita");

