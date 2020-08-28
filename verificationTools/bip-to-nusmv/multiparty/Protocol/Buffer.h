/*
 *  Buffer.h
 *  
 *
 *  Created by Mohamad JABER on 5/26/09.
 *  Copyright 2009 VERIMAG. All rights reserved.
 *
 */

#include <cstdlib>
#include <stdio.h>
#include "Message.h"

typedef int element;

typedef struct cell
{
		element data;
		struct cell *link;
	}*pcell;

struct buffer
{
	pcell head,queue;
};




void CreateBuffer ( buffer *f ) ;

bool BufferIsEmpty ( buffer f ) ;

bool ContainElement ( buffer f , element e ) ;

void PrintBuffer ( buffer f ) ;

void AddUniqueElement ( buffer *f , element e ) ;

void AddElement ( buffer *f , element e ) ;

int RemoveTopElement ( buffer *f ) ;

void SetEmpty ( buffer *f ) ;

int GetTop ( buffer f,element *e ) ;

int TopIsLock ( buffer f ) ;

bool TopIsUnlock ( buffer f ) ;

bool TopIsStart ( buffer f ) ;

bool TopIsAckref ( buffer f ) ;

bool TopIsOffer ( buffer f) ;

int TopIsParticipate ( buffer f );

int TopIsRefuse ( buffer f ) ;

int TopIsOk ( buffer f ) ;

element GetTopElement ( buffer f ) ;

int IndexOfElement ( buffer f , element e ) ;

int BufferSize ( buffer f ) ;

buffer GetCopyBuffer ( buffer f ) ;

int GetSmallestElement ( buffer f ) ;

buffer GetIntersect ( buffer f1 , buffer f2 ) ;

void RemoveElement ( buffer *f , element e ) ;

void RemoveSubBuffer ( buffer *f , buffer f1 ) ;

bool SizeIsOne ( buffer f ) ;

bool SizeIsBiggerOne ( buffer f ) ;







