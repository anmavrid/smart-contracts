/*
 *  Buffer.cpp
 *  
 *
 *  Created by Mohamad JABER on 5/26/09.
 *  Copyright 2009 VERIMAG. All rights reserved.
 *
 */


#include "Buffer.h"


void CreateBuffer ( buffer *f )
{
	f->head=f->queue = NULL;
}

bool BufferIsEmpty ( buffer f )
{
	return (f.head == NULL);
}

bool ContainElement ( buffer f , element e )
{
	pcell p = f.head;
	while(p != NULL){
		if(p->data == e)
			return true;
		p = p->link;
	}
	return false;
}

void PrintBuffer ( buffer f ) 
{
	printf("Buffer :") ;
	pcell p = f.head ;
	while(p != NULL){
		printf("%d ",p->data);
		p = p->link ;
	}
	printf("\n");
}

void AddUniqueElement ( buffer *f , element e )
{
	if(ContainElement(*f,e) == false)
	{
		pcell p = NULL;
		p=(pcell)malloc(sizeof(struct cell));
		p->data=e;
		p->link=NULL;
		if (BufferIsEmpty(*f))
			f->queue=f->head=p;
		else
		{
			f->queue->link=p;
			f->queue=p;
		}
	}
}

void AddElement (buffer *f , element e )
{
	pcell p = NULL;
	p = ( pcell ) malloc ( sizeof ( struct cell ) ) ;
	p->data = e ;
	p->link = NULL ;
	if ( BufferIsEmpty( *f ) )
		f->queue=f->head = p ;
	else
	{
		f->queue->link = p ;
		f->queue = p ;
	}
}

int RemoveTopElement ( buffer *f )
{ 
 	pcell q;
 	if(BufferIsEmpty(*f)) return 0;
 	if (f->queue==f->head)
  	{
		free(f->head);
  		f->head=f->queue=NULL;
  	}
 	else
  	{
		q=f->head;
 		f->head=f->head->link;
  		free(q);
   		q=NULL;
  	}
	return 1;
}

void SetEmpty ( buffer *f )
{
	while(RemoveTopElement(f));
}

int GetTop (buffer f , element *e )
{ 
	if (BufferIsEmpty(f))  return 0;
 	*e=f.head->data;
 	return 1;
}

int TopIsLock ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Lock)
		return 1;
	return 0 ;
}

bool TopIsUnlock ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Unlock)
		return 1;
	return 0 ; 
}

bool TopIsStart ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Start)
		return 1;
	return 0 ;
}

bool TopIsAckref ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Ackref)
		return 1;
	return 0 ;
}

bool TopIsOffer ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Offer)
		return 1;
	return 0 ;
}

int TopIsParticipate ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Participate)
		return 1;
	return 0 ;
}

int TopIsRefuse ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Refuse)
		return 1;
	return 0 ;
}

int TopIsOk ( buffer f )
{ 
 	if (BufferIsEmpty(f))  return 0;
 	if(f.head->data == Ok)
		return 1;
	return 0 ;
}

element GetTopElement ( buffer f )
{
	if(!BufferIsEmpty(f))
		return f.head->data;
	else return -1;
}

int IndexOfElement ( buffer f , element e )
{
	pcell p = f.head;
	int i = 1 ;
	while (p != NULL) {
		if(p->data == e)
			return i;
		p = p->link;
		i++;
	}
	return -1;
}

int BufferSize ( buffer f)
{
	int size = 0;
	pcell p = f.head;
	while (p != NULL) {
		size++;
		p = p->link;
	}
	return size;
}

buffer GetCopyBuffer ( buffer f )
{
	buffer f1;
	CreateBuffer(&f1);
	pcell p = f.head;
	while (p != NULL) {
		AddElement(&f1,p->data);
		p = p->link;
	}
	return f1;
}

int GetSmallestElement ( buffer f )
{
	pcell p = f.head;
	int min = p->data;
	while(p != NULL)
	{
		if(p->data < min)
			min = p->data;
		p = p->link;
	}
	return min;
}

buffer GetIntersect ( buffer f1 , buffer f2 )
{
	buffer f;
	CreateBuffer(&f);
	pcell p = f1.head;
	while(p != NULL)
	{
		if(ContainElement(f2,p->data))
			AddUniqueElement(&f,p->data);
		p = p->link;
	}
	return f;
}

void RemoveElement ( buffer *f , element e )
{
	pcell  cur;
	pcell  prev;
	// Si la liste est vide il n'y a rien à effacer
	if (f->head == NULL) return;
	// Positionnement des deux éléments "prev" et "cur" sur l'élément juste avant et sur l'élément à efface
	for (cur=f->head, prev=NULL; cur != NULL && cur->data != e; prev=cur, cur=cur->link);
	if(cur == NULL) return;
	// Si l'élément précédent existe
	if (prev != NULL)
		// L'élément précédent prend l'adresse du suivant
		prev->link=cur->link;
	else
		// L'élément à supprimer était le premier => celui-ci change
		f->head=cur->link;
	// Si l'élément à effacer était le dernier
	if (cur->link == NULL)
		// Le dernier élément de la liste change
		f->queue=prev;
	//free(cur);
}

void RemoveSubBuffer ( buffer *f , buffer f1 )
{
	pcell p = f1.head;
	while (p != NULL) {
		RemoveElement(f,p->data);
		p = p->link;
	}
}

bool SizeIsOne ( buffer f )
{
	
	if( !BufferIsEmpty(f) && f.head == f.queue)
		return true;
	else 
		return false;
}

bool SizeIsBiggerOne ( buffer f )
{
	if( !BufferIsEmpty(f) && !SizeIsOne(f))
		return true;
	else 
		return false;
}

int getMessOfferPart(buffer f)
{
	if (SizeIsOne(f)) return MParticipate();
	else if(SizeIsBiggerOne(f)) return MOffer();
	else return -1;	
}

int ComputeN(int n )
{
	if(n>0) {return n-1;}
	else return 0;
}

int setfalse_refuse(int idsender, int false_refuse)
{
	if (false_refuse == idsender)  return -1 ;
	else return false_refuse ;
}








