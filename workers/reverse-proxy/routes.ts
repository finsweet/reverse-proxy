import type { Handler } from 'worktop';

const data = require('./cfw.json');
const cdn:any = data.globals.MAPPED_CDN.replace('ENV:', '');
const subdomains:any = data.globals.SUBDOMAINS.replace('ENV:', '').split(/[/?#]/);
const cdnpath = cdn.match(/[a-z]([^@]*)/)[0];
//const exturl=JSON.stringify(cdn).match(/[*(http)]\D+[a-z]/);
const exturl  = cdn.match(/((http|un)[^'}\s]*)/);


export const index: Handler =  async function (req, res) {
		const url = req.headers.get('host') || '';
		const path = req.params.path1;
		const path2 = req.params.path2;
		const otherpath = req.params.wild;
		const otherpaths= [path2, otherpath].join('/');
		const requrl:any = converttourl(req.url);
		const subdomain = subdomains[0].includes(path);
		const subdomainUrl:any = domain(url)
				
					const file = path.match(/([^@.]*)/)[0];
					//check if it contains @
					if (path.includes('@') && (file == cdnpath)) {
						const version = path.match(/\d+(\.\d+)+/)[0];
						const desturl =exturl[0].replace(new RegExp('\\X\\b'), version);
						const destinationurl = urlwithoutwww(desturl)
						return fetch(destinationurl);
					}

					//if cdn includes filename without @version
						else if  ((file == cdnpath) && !(path[0].includes('@'))) {
						const desturl =exturl[0].replace(new RegExp('\\@X\\b'), '');
						const destinationurl =  urlwithoutwww(desturl);
						return fetch(destinationurl);
						
					}
		

					//Convert path to Subdomain
					if(subdomain){
						const destinationURL = "https://"+path+"."+subdomainUrl+"/"+otherpaths;	
							return fetch(destinationURL)
						  }
					//deliver origin URL
					else {
						return fetch(url)
					
						}
		
}


function  converttourl(url:any) {
	const trimurl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
	const nurl = trimurl;
	const newurl = "https://www.".concat(nurl)
	return(newurl)
}
function urlwithoutwww (url:any)  {
	const trimurl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
	const nurl = trimurl;
	const newurl = "https://".concat(nurl)
	return(newurl)
}
function domain (url:any) {
	const urlParts =	url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
	const domain = urlParts;
	return(domain)
}
