define([
    'common/util/ejs',
    'text!./contractBIPStart.ejs',
    'text!./contractBIPEnd.ejs',
    'text!./BIPPorts.ejs',
    'text!./BIPStates.ejs',
    'text!./initialBIPAction.ejs',
    'text!./BIPComplete.ejs'
], function (ejs,
             classStart,
             classEnd,
             ports,
             states,
             initialAction,
             complete
             ) {

    return {
        contractType: {
            bipStart: classStart,
            bipEnd: classEnd,
            bipPorts: ports,
            bipStates: states,
            bipInitialAction: initialAction,
            complete: ejs.render(complete, {
                classStart: classStart,
                ports: ports,
                states: states,
                initialAction: initialAction,
                classEnd: classEnd
            })
        }
    };
});
