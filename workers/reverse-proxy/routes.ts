import type { Handler } from 'worktop';

const data = require('./cfw.json');
const cdn:any = data.globals.MAPPED_CDN.replace('ENV:', '');
const subdomains:any = data.globals.SUBDOMAINS.replace('ENV:', '').split(/[/?#]/);
const exturl=JSON.stringify(cdn).match(/[*(http)]\D+[a-z]/);


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
					//const file = path[0].split('@')[0];
					const file = path[0].match(/([^@.]*)/)[0];
					const cdnpath = cdn.match(/[a-z]([^@]*)/)[0];

					//check if it contains @
					if (path[0].includes('@') && (file == cdnpath)) {
						//const versions = path[0].match(/[\d\.]+/);
						const versions = path[0].match(/\b([0-9][0-9.]*)\b/);
						const version = versions[0].slice(0, -1);
						const fileext = /(?:\.([^.]+))?$/.exec(path[0])[1];
						const url = `${exturl[0]}@${version}/${file}.${fileext}`;
						return Response.redirect(url, 302);
					}
					//if cdn includes filename without @version
						else if  ((file == cdnpath) && !(path[0].includes('@'))) {
						const url = `${exturl[0]}/`+path[0];
						return Response.redirect(url, 302);
					}
		} catch(e){
				console.log( e );
		}

		try {
					//Convert path to Subdomain
					if(subdomain){
						const url = "https://"+path[0]+"."+subdomainUrl+"/"+otherpaths;
						return Response.redirect(url, 302);
						}
					//deliver origin URL
					else {
						return Response.redirect(requrl, 302);
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

const domain  = async(url:any) => {
	const urlParts =	url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
	const domain = urlParts;
	return(domain)
}
