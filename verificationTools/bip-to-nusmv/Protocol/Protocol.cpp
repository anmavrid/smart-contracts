buffer getConnectorOf_adders1s3 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 102 );
	}
	return f ; 
}

buffer getConnectorOf_adders1s2 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 101 );
	}
	return f ; 
}

buffer getConnectorOf_adders1s1 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 100 );
	}
	return f ; 
}

buffer getConnectorOf_adders1node ( bool b0 , bool b1 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 100 );
		AddUniqueElement( &f, 101 );
		AddUniqueElement( &f, 102 );
	}
	if ( b1 == true ) 
	{
		AddUniqueElement( &f, 109 );
	}
	return f ; 
}

buffer getConnectorOf_adders2s3 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 105 );
	}
	return f ; 
}

buffer getConnectorOf_adders2s2 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 104 );
	}
	return f ; 
}

buffer getConnectorOf_adders2s1 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 103 );
	}
	return f ; 
}

buffer getConnectorOf_adders2node ( bool b0 , bool b1 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 103 );
		AddUniqueElement( &f, 104 );
		AddUniqueElement( &f, 105 );
	}
	if ( b1 == true ) 
	{
		AddUniqueElement( &f, 110 );
	}
	return f ; 
}

buffer getConnectorOf_adders3s3 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 108 );
	}
	return f ; 
}

buffer getConnectorOf_adders3s2 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 107 );
	}
	return f ; 
}

buffer getConnectorOf_adders3s1 ( bool b0 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 106 );
	}
	return f ; 
}

buffer getConnectorOf_adders3node ( bool b0 , bool b1 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 106 );
		AddUniqueElement( &f, 107 );
		AddUniqueElement( &f, 108 );
	}
	if ( b1 == true ) 
	{
		AddUniqueElement( &f, 111 );
	}
	return f ; 
}

buffer getConnectorOf_addernode ( bool b0 , bool b1 ) 
{
	buffer f ;
	CreateBuffer( &f );
	if ( b0 == true ) 
	{
		AddUniqueElement( &f, 109 );
		AddUniqueElement( &f, 110 );
		AddUniqueElement( &f, 111 );
	}
	if ( b1 == true ) 
	{
		AddUniqueElement( &f, 112 );
	}
	return f ; 
}

