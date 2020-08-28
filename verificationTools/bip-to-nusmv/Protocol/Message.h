/*
 *  Message.h
 *  
 *
 *  Created by Mohamad JABER on 5/26/09.
 *  Copyright 2009 VERIMAG. All rights reserved.
 *
 */


typedef enum {Offer, Lock, Unlock, Start, Ackref, Refuse, Participate,Ok} Message ;
Message MOffer() { return Offer;} 
Message MLock() { return Lock;} 
Message MUnlock() { return Unlock;} 
Message MStart() { return Start;} 
Message MAckref() { return Ackref;} 
Message MRefuse() { return Refuse;} 
Message MParticipate() { return Participate;}
Message MOk() { return Ok;}


