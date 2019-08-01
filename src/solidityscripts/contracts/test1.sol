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
  //Transition addOption
  function addOption (
  //Insert function input
  string option  
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Setup);

   //Insert guards
    
     

  
   //State change
    state = States.InTransition; 
   //Insert statements

        options.push(option);  

   //State change
  state = States.Setup; 
  }
  //Transition addParticipant
  function addParticipant (
  //Insert function input
    address participant
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Setup);

   //Insert guards
    require(
     !participants[participant]

   ); 
   //State change
    state = States.InTransition; 
   //Insert statements

     participants[participant] = true;
    numParticipants += 1; 

   //State change
  state = States.Setup; 
  }
  //Transition cancel
  function cancel (
  //Insert function input
  
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Casting);

   //Insert guards
    require(
          numVoters < numVoters /2

   ); 
  
   //Insert statements

  

   //State change
  state = States.Canceled; 
  }
  //Transition cast
  function cast (
  //Insert function input
  uint option  
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Casting);

   //Insert guards
    require(
          participants[msg.sender] && option < options.length

   ); 
   //State change
    state = States.InTransition; 
   //Insert statements

         votes[option] += 1;
    participants[msg.sender] = false;
    numVoters += 1; 

   //State change
  state = States.Casting; 
  }
  //Transition close
  function close (
  //Insert function input
  
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Casting);

   //Insert guards
    require(
               now >= creationTime + 1 weeks 


   ); 
  
   //Insert statements

  

   //State change
  state = States.Closed; 
  }
  //Transition open
  function open (
  //Insert function input
  
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Setup);

   //Insert guards
    require(
               now <= creationTime + 1 hours


   ); 
  
   //Insert statements

  

   //State change
  state = States.Casting; 
  }
  //Transition removeOption
  function removeOption (
  //Insert function input
    uint option
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Setup);

   //Insert guards
    require(
          option < options.length

   ); 
   //State change
    state = States.InTransition; 
   //Insert statements

              options[option] = options[options.length - 1];
    options.length -= 1; 

   //State change
  state = States.Setup; 
  }
  //Transition removeParticipant
  function removeParticipant (
  //Insert function input
    address participant
  ) public
  //Insert tags
 
  //Insert function output
 
   
  {
    require(state == States.Setup);

   //Insert guards
    require(
          participants[participant]

   ); 
   //State change
    state = States.InTransition; 
   //Insert statements

     participants[participant] = false;
    numParticipants -= 1; 

   //State change
  state = States.Setup; 
  }
}
