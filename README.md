This tool is used to manage the pool objects in F5 BIGIP system. Operator can use this tool to enable/enable the pool member, make it forceoffline, clear the related connection or check the status of the pools.

Usage: node changePoolMember [options] [arguments]

options:    
  --user         the username to perform the action   
  --pass         the password to perform the action   
  --pool         the pool we want to change   
  --member       the pool member we want to change   

arguments:    
  --help         print the usage   
  --get          retrieve pool information from the remote BIGIP   
  --disable      disable the specific pool member    
  --enable       enable the specific pool member   
  --offline      take the specific pool member to forceoffline status   
  --kill         take the specific pool member to forceoffline status and clear the current connection related to the pool member    

You can also store the configuration (user, pass, etc.) into config.js file.

examples:    
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --get   
//To list all the pool and pool members.   
   
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245    --pool=webpool --member=server1:80 --disable    
//To disable the pool member.    
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --enable    
//To enable the pool member.    
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --offline    
//To forcely make the pool member offline.    
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --kill    
//To forcely make the pool member offline and clear the related connections. This action must be performed by administrator level account    
