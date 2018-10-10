import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records"

// Your retrieve function plus any additional functions go here ...
function retrieve(options){
    //---Variables---
    //Page 
    let page = options && options.page ? options.page : 1;
    //Primary colors
    let primary = ["red","blue","yellow"];
    //Offset
    let offset = (page-1)*10;

    //----Build out URL----
    let url = new URI(window.path);
    //Always limit data to 10 records
    url.addQuery("limit", 10);
    //Only add an offset if we need to
    if(offset != 0){
        url.addQuery("offset", offset);
    }
    //Only add colors if we need to
    if(options && options.colors){
        url.addQuery("color[]", options.colors);
    }
        
        
    //---Fetch URL (returns Promise)---
    return fetch(url)
        .then(function(response){
            //Transform data into JSON
            return response.json()
        }).then(function(data){

            //---Start building transformed data payload---
            //Payload Object
            let payload = {
                ids: [], 
                open: [], 
                closedPrimaryCount: 0, 
                previousPage: page == 1 || page > 51 ? null : page - 1, 
                nextPage: !data.length || page >= 50 ? null : page + 1
            };

            //Build payload if data is returned
            if(data.length){
                //Map ids to array
                payload.ids = data.map(value => value.id);
                //Find all open dispositions and add data to the open parameter in payload
                payload.open = data.filter(value => {
                    primary.includes(value.color.toLowerCase()) ? value.isPrimary = true : value.isPrimary = false;
                    return value.disposition == "open"
                });
                //Find all closed disposition and primary colors and get length of that
                payload.closedPrimaryCount = data.filter(value => value.disposition == "closed" && value.isPrimary).length; 
            }
            //Return the payload
            return payload
            //Error out if fetch request fails
        }).catch(function(error){
            //Handle errors
            console.log("Error fetching data: ", error.message);
        });
}

export default retrieve;