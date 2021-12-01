const express = require('express')
const app = express()
const app_port = 3000
const apache_fuseki_persistence_url = 'http://ec2-3-142-53-61.us-east-2.compute.amazonaws.com:3030/dataset.html?tab=query&ds=/Category'
const http = require('http');
const rdf_url_prefix_tag = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'
const rdff_url_prefix_tag = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'

const SPARQL_GET_ALL_CLASSES = function () {
    postData =
        `
  prefix owl: <http://www.w3.org/2002/07/owl#>
  prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?class ?label ?description
  WHERE {
    ?class a owl:Class.
    OPTIONAL { ?class rdfs:label ?label}
    OPTIONAL { ?class rdfs:comment ?description}
  }
  `
    const options = {
        hostname: 'localhost',
        port: 3030,
        path: '/data/query',
        method: 'POST',
        headers: {
            'Accept': 'application/sparql-results+json',
            'Content-Type': 'application/sparql-query'
        }
    }

    return function (resolve, reject) {
        var req = http.request(options, function (res) {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            var data = {};
            res.on('data', function (chunk) {
                data = chunk;
            });
            res.on('end', function () {
                console.log('sup')
                resolve(JSON.parse(data));
                console.log(JSON.parse(data));
            });
        });

        req.on('error', function (err) {
            reject(err);
        });
        if (postData) {
            req.write(postData);
        }
        req.end();
    };
}




function rdfs_class_exists(requested_class) {
    return SPARQL_GET_ALL_CLASSES().then(result => {
        let found_class = false;
        result.results.bindings.forEach(element => {
            if (element.class.value == 'http://localhost:3000/data#' + requested_class) {
                found_class = true;
            }
        })
        return found_class;
    });
}

app.get('*', function (req, res, next) {
    path_elements = req.path.split('#');
    var requested_class = path_elements[1];

    rdfs_class_exists(requested_class).then((RDFS_Class_found) => {
        if (RDFS_Class_found) {
            if (path_elements.length > 3) {
                sparql_GET_Data_Element(path_elements[3]).then(result => {
                    console.log('result: ' + result);
                    res.send(result);
                }).catch(error => {
                    console.log(error);
                    res.send(error);
                })
            } else {
                sparql_GET_Data_Element(path_elements[1]).then(result => {
                    console.log('result: ' + result);
                    var ele = sparql_GET_Data_element(path_elements[1]);
                    res.send(ele);
                    //    res.send(result);
                }).catch(error => {
                    console.log(error);
                    res.send(error);
                })
            }

        } else res.status(400).send("RDFS Class not Found");
    });
})

app.post('*', function (req, res, next) {
    next();

})

app.delete('*', function (req, res, next) {
    next();
})

app.put('*', function (req, res, next) {
    next();
})

app.all('*', function (req, res, next) {
    res.status(400).send('No Elements found');
})

/**
 * Die API wartet auf Requests am Port 3000.
 * Wird sie per Node gitlokal gestartet läuft sie unter http://localhost:3000/
 */
app.listen(app_port, function () {
    let x = SPARQL_GET_ALL_CLASSES()
    console.log('Example app listening on port 3000!');
});
