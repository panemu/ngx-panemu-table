import {NgDocApi} from '@ng-doc/core';

const Api: NgDocApi = {
	title: 'API References',
	scopes: [
		{
      name: 'ngx-panemu-table',
      route: 'panemu',
      include: 'projects/ngx-panemu-table/src/lib/**/*.ts',
    },
	],
};

export default Api;
