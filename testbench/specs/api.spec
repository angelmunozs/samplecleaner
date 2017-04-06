Testing samplecleaner API
=========================

This an executable specification file, consisting of the API test bench.


* Call to /api/user must return an empty object when not logged

Empty user when not logged
--------------------------

tags: empty user not logged in

* Call to /api/login must return an error when wrong credentials

Login with incorrect data
-------------------------

tags: wrong params login

* Call to /api/login must return an OK message

Login with an existing user
---------------------------

tags: empty user not logged in

