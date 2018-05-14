define([
    'common/util/ejs',
    'text!./contractBIPStart.ejs',
    'text!./contractBIPEnd.ejs',
    'text!./BIPPorts.ejs',
    'text!./BIPStates.ejs',
    'text!./initialBIPAction.ejs',
    'text!./BIPTransitions.ejs',
    'text!./BIPComplete.ejs'
], function (ejs,
             classStart,
             classEnd,
             ports,
             states,
             initialAction,
             transitions,
             complete
             ) {

    return {
        contractType: {
            bipStart: classStart,
            bipEnd: classEnd,
            bipPorts: ports,
            bipStates: states,
            bipInitialAction: initialAction,
            bipTransitions: transitions,
            complete: ejs.render(complete, {
                classStart: classStart,
                ports: ports,
                states: states,
                initialAction: initialAction,
                transitions: transitions,
                classEnd: classEnd
            })
        }
    };
});
