int getCompFail_res(int nArgs , ... ) {
	va_list list;
	va_start(list, nArgs);
	for(int i = 0; i < nArgs ; i++) {
		int n_Comp = va_arg(list,int) ; 
		int N_Comp = va_arg(list,int) ; 
		int id = va_arg(list,int) ; 
		if(n_Comp <= N_Comp)  { 
			va_end ( list );  return id ; 
		}
	}
 	va_end ( list );
	return -1 ;
}

void UpdateForkReceive(int nArgs, ...) {
	va_list list;
	va_start(list, nArgs);
	for(int i = 0; i < nArgs ; i++) {
		int* N_Comp = va_arg(list,int*) ; 
		int* N_CompTMP = va_arg(list,int*) ; 
		if(*N_Comp < *N_CompTMP)
			*N_Comp = *N_CompTMP ;
		else
			*N_CompTMP = *N_Comp ; 
	}
 	va_end ( list );
}

void UpdateForkSend(int nArgs, ...) {
	va_list list;
	va_start(list, nArgs);
	for(int i = 0; i < nArgs ; i++) {
		int N_Comp = va_arg(list,int) ; 
		int* N_CompTMP = va_arg(list,int*) ; 
		*N_CompTMP = N_Comp ;
	}
 	va_end ( list );
}

int GetWhichFail(int nArgs, ...) {
	va_list list;
	va_start(list, nArgs);
	for(int i = 0; i < nArgs ; i++) {
		int n = va_arg(list,int) ; 
		if(n != -1 ) {
			va_end ( list );
			return n ; 
		}
	}
 	va_end ( list );
}