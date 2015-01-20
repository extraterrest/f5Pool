process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var request = require("request");
var argv = require('optimist').argv;
var fs = require('fs');

settings = JSON.parse(fs.readFileSync('config.js','ascii'));

if (settings.user) user = settings.user;
if (settings.pass) pass = settings.pass;
if (settings.pool) poolName = settings.pool;
if (settings.member) poolMemberName = settings.member;
if (settings.bigip) bigip = settings.bigip;

action = '';
state = '';
port = '';

usageguide = "\
\n\
Usage: node changePoolMember [options] [arguments] \n\
\n\
options: \n\
  --user         the username to perform the action \n\
  --pass         the password to perform the action \n\
  --pool         the pool we want to change \n\
  --member       the pool member we want to change \n\
   \n\
arguments: \n\
  --help         print the usage \n\
  --get          retrieve pool information from the remote BIGIP \n\
  --disable      disable the specific pool member \n\
  --enable       enable the specific pool member \n\
  --offline      take the specific pool member to forceoffline status \n\
  --kill         take the specific pool member to forceoffline status and clear the current connection related to the pool member \n\
\n\
examples: \n\
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --get\n\
//To list all the pool and pool members.\n\n\
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=webpool --member=server1:80 --disable\n\
//To disable the pool member.\n\n\
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --enable\n\
//To enable the pool member.\n\n\
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --offline\n\
//To forcely make the pool member offline.\n\n\
node changePoolMember --user=admin --pass=admin --bigip=192.168.1.245 --pool=ftppool --member=10.0.0.1:21 --kill\n\
//To forcely make the pool member offline and clear the related connections. This action must be performed by administrator level account\n"


//console.log(argv);

if (argv.user) user = argv.user;
if (argv.pass) pass = argv.pass;
if (argv.pool) poolName = argv.pool;
if (argv.member) poolMemberName = argv.member;
if (argv.bigip) bigip = argv.bigip;

if (argv.enable) {
  action = {'state':'user-up','session':'user-enabled'};
  changePool(user,pass,poolName,poolMemberName,action,bigip);
} else if (argv.disable) {
  action = {'session':'user-disabled'};
  changePool(user,pass,poolName,poolMemberName,action,bigip);
} else if (argv.offline) {
  action = {'state':'user-down','session':'user-disabled'};
  changePool(user,pass,poolName,poolMemberName,action,bigip);
} else if (argv.kill) {
  action = {'state':'user-down','session':'user-disabled'};
  changePool(user,pass,poolName,poolMemberName,action,bigip);
  killConn(user,pass,bigip,poolMemberName);
}
else if (argv.get) { 
  getPoolState(user, pass,bigip);
} else if (argv.help) {
  usage();
} else usage();

function usage(){
	console.log(usageguide);
}
function getPoolState(user, pass, bigip) {
  //console.log("bigip" + bigip);
  //console.log("user" + user);
  request({
    uri: "https://" + bigip + "/mgmt/tm/ltm/pool?expandSubcollections=true",
    method: "GET",
    timeout: 10000,
    auth: {
      'user': user,
	  'pass': pass,
	  'sendImmediately': false
    }
  }, function(error, response, body) {
    target = [];
	//console.log(error);
	//console.log(body);
    JSON.parse(body).items.forEach(function(pool){
      mymembers = [];
      pool.membersReference.items.forEach(function(member){
        mymembers.push({name:member.name.substr(0, member.name.indexOf(':')), address: member.address, state:member.state, session:member.session, port:member.name.substr(member.name.indexOf(':')+1)});
		//console.log(member.name.substr(member.name.indexOf(':')+1));
		//console.log(getAddress(user,pass,bigip,member.name));
      });
      target.push({
        name: pool.name,
	  poolmembers: mymembers,
    });
  });
  console.log("\n---------- Pool Information for " + bigip + " ----------");
  console.log("\n----Pool Member -- IP address -- state -- session state ------");
    target.forEach(function(mypool){
    console.log("|--"+mypool.name);
    mypool.poolmembers.forEach(function(mymembers){
      console.log("|----"+mymembers.name+':'+mymembers.port + "\t" +mymembers.address+"\t"+mymembers.state+"\t"+mymembers.session);
    });
  });
});

}

function changePool(user, pass, poolName, poolMemberName, action, bigip) {
  request({
    uri: "https://" + bigip + "/mgmt/tm/ltm/pool/"+poolName+"/members/"+poolMemberName,
    method: "PUT",
    timeout: 10000,
    auth: {
      'user': user,
	  'pass': pass,
	  'sendImmediately': false
    },
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
    followRedirect: true,
    body: action,
  }, function(error, response, body) {
    if(response.statusCode == 200){
      console.log('Changed Successfull.');
	  getPoolState(user,pass,bigip);
    } else {
      //console.log('error: '+ response.statusCode);
      //console.log(body);
      getPoolState(user,pass,bigip);
    }
  });
}

//function delconn(user,pass,poolName)
function killConn (user,pass,bigip, poolMemberName) {
  //console.log("killconn  " + bigip, poolMemberName);
  nodename = poolMemberName.substr(0, poolMemberName.indexOf(':'));
  port = poolMemberName.substr(poolMemberName.indexOf(':')+1);
  //console.log(nodename);
  request({
    uri: "https://" + bigip + "/mgmt/tm/ltm/node/"+nodename,
    method: "GET",
    timeout: 10000,
    auth: {
      'user': user,
	  'pass': pass,
	  'sendImmediately': false
    }
  }, function(error, response, body) {
	//console.log("in function output console.log"+JSON.parse(body).address);
    nodeaddress = JSON.parse(body).address.toString();
    request({
      uri: "https://" + bigip + "/mgmt/tm/cli/script",
	  method: "POST",
      timeout: 10000,
      auth: {
        'user': user,
	    'pass': pass,
	    'sendImmediately': false
      },
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
      followRedirect: true,
      body: {"command":"run","utilCmdArgs":"delconn " + nodeaddress + " " + port },
    }, function(error, response, body) {
      if(response.statusCode == 200){
        //console.log('Changed Successfull.');
	    //getPoolState(user,pass,bigip);
      } else {
        console.log('error: '+ response.statusCode);
        console.log(body);
      }
    });

  });
}