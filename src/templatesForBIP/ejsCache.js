define([
    'common/util/ejs',
    'text!./contractBIPStart.ejs',
    'text!./contractBIPEnd.ejs',
    'text!./BIPPorts.ejs',
    'text!./BIPStates.ejs',
    'text!./BIPComplete.ejs'
], function (ejs,
             classStart,
             classEnd,
             ports,
             states,
             complete
             ) {

    return {
        contractType: {
            bipStart: classStart,
            bipEnd: classEnd,
            bipPorts: ports,
            bipStates: states,
            complete: ejs.render(complete, {
                classStart: classStart,
                ports: ports,
                states: states,
                classEnd: classEnd
            })
        }
    };
});
