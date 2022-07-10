const http = require('http');
const chalk =  require('chalk');

const _baseUrl = "http://127.0.0.1:8888/";

function orderPizza(pin, type, name) {
    // Get the Nearby Pizza Shop
    http.get(_baseUrl + "api/v1/pizzahub/shops/" + pin,function(res){
        let data = [];
        res.on('data', chunk => {
            data.push(chunk);
        });
        res.on('end', () => {
            // console.log('Response ended: ');
            result = JSON.parse(data);
            shopid = result[0].id;
            
            http.get(_baseUrl + "api/v1/pizzahub/allpizzas/" + shopid, function(res){
                data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                });
                res.on('end', () => {
                    // console.log('Response ended: ');
                    let pizzas = JSON.parse(data)
                    console.log('Available Pizzas in the Shop =>', pizzas);
                    // Find if my pizza is availavle
                    let myPizza = pizzas.find((pizza) => {
                       return (pizza.PizzaType.toString().toLowerCase() === type.toLowerCase() && pizza.PizzaName.toString().toLowerCase() === name.toLowerCase());
                    });
                    if (myPizza) {
                        console.log(`Yes, we found the customer pizza: ${myPizza.PizzaName}`);
                        // Check for the free beverages
                        console.log('Querying for the available beverages...');
                    }
                    http.get(_baseUrl + "api/v1/pizzahub/beverage/" + myPizza.id, function(res){
                        data = [];
                        res.on('data', chunk => {
                            data.push(chunk);
                        });

                        res.on('end', () => {
                            // console.log('Response ended: ');
                            result = JSON.parse(data);
                            console.log(result);
                            // Prepare an order
                            let order = JSON.stringify({
                                Pizza: name,
                                PizzaType: type,
                                Beverage: result[0].BeverageName
                            });
                            const req = http.request(
                            // Configuration object with request details
                            {
                                hostname: "127.0.0.1",
                                port: 8888,
                                path: "/api/v1/pizzahub/placeorder",
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': order.length
                                }
                            }, (res) => {
                                    data = [];
                                    res.on('data', chunk => {
                                        data.push(chunk);
                                    });
                                    res.on('end', ()=>{
                                        result = JSON.parse(data);
                                        console.log(chalk.green.inverse(`Your order of "${result[0].PizzaType}" "${result[0].Pizza}" pizza with ${result[0].Beverage} has been placed successfully with Order ID ${result[0].id}.`));
                                    });
                                }).on('error', (error) => {
                                    console.error(error)
                                });
                                    
                                req.write(order);
                                req.end();
                        });
                    
                    });
                });    
            });
        });
    }).on('error', err => {
        console.log('Error: ', err.message);
    });
}

// Placing your Pizza Order:
orderPizza(712258, "Veg", "margarita");
