# doto-server
Server files for Doto project!

### Route:&emsp;'/'
##### Method: 
* GET: 
    * Get greeting 'Hi'
----

### Route:&emsp;'/auth'
##### Method: 

* POST: 
    * Generates JWT Token
----

### Route:&emsp;'/done'
##### Method: 
* GET: 
    * Get the data array of problems solved
    * Required Fields (as Headers)
        * authrization bearer {token}
* PUT:
    * Update details of the array containing details of problem solved
    * Required Fields (as Headers)
        * authrization bearer {token}
    
    * Required Fields (as form-data or url-encoded in request body)
        * ``id``, ``ty``
        * id of the problem to be added or deleted.
        * ty: 'add'/'del' - add or delete from array.
----
### Route:&emsp;'/leaderboard'
##### Method: 
* GET: 
    * Get the sorted array of ranks
----
### Route:&emsp;'/leaderboard/count
##### Method: 
* GET:  
    * Get the count of registered users.
----
