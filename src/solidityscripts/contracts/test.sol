contract SimpleStorage {
  uint private creationTime = now;
  
  

  //States definition
  enum States {
    InTransition,
    InitialState
}
  States private state = States.InitialState;
  //Insert variable definitions

  uint storedData;
  

 
  
//Transitions 
function get () public
  constant    returns (uint retVal) 
{
    require(state == States.InitialState);
    
    //State change
    state = States.InTransition;
    //Actions
    return storedData;
       
    //State change
    state = States.InitialState; 
}

function set (uint x) public
    
{
    require(state == States.InitialState);
    
    //State change
    state = States.InTransition;
    //Actions
    storedData = x;
       
    //State change
    state = States.InitialState; 
}


}