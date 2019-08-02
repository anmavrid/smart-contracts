contract Voting {
  uint private creationTime = now;
  
  

  //States definition
  enum States {
    InTransition,
    Setup, 
    Canceled, 
    Casting, 
    Closed  
  }
  States private state = States.Setup;
  //Insert variable definitions

  mapping(address => bool) private participants;
  uint private numParticipants; // total number of participants
  uint private numVoters; // number of participants who have voted
  string[] private options;
  mapping(uint => uint) votes; // vote for each option (index of option in array)
//Transitions 
function addOption (string option  ) public
 
{
    require(state == States.Setup);
    
    //State change
    state = States.InTransition;
    //Actions
         options.push(option);    
    //State change
    state = States.Setup; 
}

function addParticipant (  address participant) public
 
{
    require(state == States.Setup);
   //Guards
    require(!participants[participant]);   
    //State change
    state = States.InTransition;
    //Actions
      participants[participant] = true;
    numParticipants += 1;   
    //State change
    state = States.Setup; 
}

function cancel () public
 
{
    require(state == States.Casting);
   //Guards
    require(     numVoters < numVoters /2);     
    //State change
    state = States.Canceled; 
}

function cast (uint option  ) public
 
{
    require(state == States.Casting);
   //Guards
    require(     participants[msg.sender] && option < options.length);   
    //State change
    state = States.InTransition;
    //Actions
          votes[option] += 1;
    participants[msg.sender] = false;
    numVoters += 1;   
    //State change
    state = States.Casting; 
}

function close () public
 
{
    require(state == States.Casting);
   //Guards
    require(          now >= creationTime + 1 weeks 
);     
    //State change
    state = States.Closed; 
}

function open () public
 
{
    require(state == States.Setup);
   //Guards
    require(          now <= creationTime + 1 hours
);     
    //State change
    state = States.Casting; 
}

function removeOption (  uint option) public
 
{
    require(state == States.Setup);
   //Guards
    require(     option < options.length);   
    //State change
    state = States.InTransition;
    //Actions
               options[option] = options[options.length - 1];
    options.length -= 1;   
    //State change
    state = States.Setup; 
}

function removeParticipant (  address participant) public
 
{
    require(state == States.Setup);
   //Guards
    require(     participants[participant]);   
    //State change
    state = States.InTransition;
    //Actions
      participants[participant] = false;
    numParticipants -= 1;   
    //State change
    state = States.Setup; 
}


}