This tool is used to manage the pool objects in F5 BIGIP system. Operator can use this tool to enable/enable the pool member, make it forceoffline, clear the related connection or check the status of the pools.

Usage: node changePoolMember [options] [arguments]

options: </br>
  --user         the username to perform the action</br>
  --pass         the password to perform the action</br>
  --pool         the pool we want to change</br>
  --member       the pool member we want to change</br>

arguments: </br>
  --help         print the usage</br>
  --get          retrieve pool information from the remote BIGIP</br>
  --disable      disable the specific pool member </br>
  --enable       enable the specific pool member</br>
  --offline      take the specific pool member to forceoffline status</br>
  --kill         take the specific pool member to forceoffline status and clear the current connection related to the pool member </br>

You can also store the configuration (user, pass, etc.) into config.js file.

examples: </br>
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --get</br>
//To list all the pool and pool members.</br>
</br>
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245</br> --pool=webpool --member=server1:80 --disable </br>
//To disable the pool member. </br>
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --enable </br>
//To enable the pool member. </br>
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --offline </br>
//To forcely make the pool member offline. </br>
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --kill </br>
//To forcely make the pool member offline and clear the related connections. This action must be performed by administrator level account </br>
