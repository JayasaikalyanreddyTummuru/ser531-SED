const express = require('express')
const app = express()
const app_port = 3000
var cors = require('cors')
const http = require('http');
const axios = require('axios')
const https = require('https')
const data = 'SELECT ?subject ?predicate ?object WHERE { ?subject ?predicate ?object } LIMIT 25'
const host = 'http://ec2-3-142-53-61.us-east-2.compute.amazonaws.com:3030/Category/query?query='+ data

const res = axios.get(host, {
    headers: {
        'Accept':' application/sparql-results+json',
        'Accept-Encoding' : 'gzip deflate',
        'Accept-Language' : 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie' : 'JSESSIONID=node0me5zssicdbo31qbq9k2ri3xjh1.node0'
    }
}).then((response) => {
    console.log(response.data.results);
    console.log(response.data.results.bindings[0].subject);
});
console.log(res);
