a repo dedicated to tracking down a leak in node 0.6.7.

## to run the server

    $ node parent.js

## to run load test

(using apache bench)

    $ ab -c 200 -n 1000000 http://127.0.0.1:38580/

note RES memory size before and after
