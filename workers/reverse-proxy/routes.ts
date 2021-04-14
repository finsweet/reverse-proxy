import type { Handler } from 'worktop';

const data = require('./cfw.json');
const cdn:any = data.globals.MAPPED_CDN.replace('ENV:', '');
const subdomains:any = data.globals.SUBDOMAINS.replace('ENV:', '').split(/[/?#]/);
//const exturl=JSON.stringify(cdn).match(/[*(http)]\D+[a-z]/);
const exturl  = cdn.match(/((http|un)[^'}\s]*)/);



export const index: Handler =  async function (req, res) {

		const url = req.headers.get('host') || '';
		const path = req.path.split('/');
		const path2 = req.path.split('/');
		path2.splice(0, 2);
		const otherpaths = path2.join("/");
		const requrl:any = await converttourl(req.url);
		const subdomain = subdomains[0].includes(path[1]);
		const subdomainUrl:any = await domain(url)
		
			try {
					path.shift();
					const file = path[0].match(/([^@.]*)/)[0];
					const cdnpath = cdn.match(/[a-z]([^@]*)/)[0];

					//check if it contains @
					if (path[0].includes('@') && (file == cdnpath)) {
						const version = path[0].match(/\d+(\.\d+)+/);
						const desturl =exturl[0].replace(new RegExp('\\X\\b'), version[0]);
						const destinationurl = await urlwithoutwww(desturl)
						return fetch(destinationurl);
					}

					//if cdn includes filename without @version
						else if  ((file == cdnpath) && !(path[0].includes('@'))) {
						const desturl =exturl[0].replace(new RegExp('\\@X\\b'), '');
						const destinationurl = await urlwithoutwww(desturl);
						return fetch(destinationurl);
					}
		} catch(e){
				console.log( e );
		}

		try {
					//Convert path to Subdomain
					if(subdomain){
						const url = "https://"+path[0]+"."+subdomainUrl+"/"+otherpaths;
						const response  = await fetch(url);
						return(response);
							}
					//deliver origin URL
					else {
						const response  = await fetch(url);
						return(response);
						}
		} catch(e) {
				console.log(e);
		}
}



const  converttourl = async(url:any) => {
	const trimurl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
	const nurl = trimurl;
	const newurl = "https://www.".concat(nurl)
	return(newurl)
}
const  urlwithoutwww = async(url:any) => {
	const trimurl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
	const nurl = trimurl;
	const newurl = "https://".concat(nurl)
	return(newurl)
}
const domain  = async(url:any) => {
	const urlParts =	url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
	const domain = urlParts;
	return(domain)
}
