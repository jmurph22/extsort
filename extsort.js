#!/usr/bin/env node

/*
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require('fs-extra'); //npm install fs-extra
const path = require('path');

function PrintHelp() {
	console.log("Usage: " + __filename + " [options] <dir(s)> <file(s)>\n"
		+ "	-R     | Be recursive.\n"
		+ "	--help | Print this help.\n\n"
		+ "Example: " + __filename + " /user/junk\n");
	process.exit(-1);
}

if(process.argv.length <= 2) {
	PrintHelp();
}

var recursive = false;

function ProcessFile(full_file) {
	//Store basename
	var BaseFileName = path.basename(full_file);

	//Make sure we aren't working with a dotfile.
	if(BaseFileName.charAt(0) != '.') {
		var ext = path.extname(full_file).slice(1);
		var CurrentDir = path.dirname(full_file);
		var NewDir = path.join(CurrentDir,ext);
		var NewFileLocation = path.join(NewDir,BaseFileName);
		
		fs.ensureDir(NewDir).then(() => {
			fs.move(full_file, NewFileLocation, { overwrite: true }).then(() => {
				console.log('Moved ' + full_file + ' => ' + NewFileLocation);
			}).catch(err => {
				console.error(err);
			});
		}).catch(err => { 
			console.error(err);
		});
	}
}

function ProcessPathArgs(current_path, basedir) {
	var IsRecursiveValid = () => {
		return(basedir || recursive);
	}

	//Function to check the details of the arguemtn provided
	fs.lstat(current_path).then(stats => {
		//Take this logic if the path is determined to be a file.
		if(stats.isFile()) {
			ProcessFile(current_path);
		}
		
		//Check if recursion is valid.
		else if(stats.isDirectory() && IsRecursiveValid()) {
			//Read file list into array.
			fs.readdir(current_path).then(files => {
				//Feed every file into the ProcessFile() function.
				files.forEach(file => {
					ProcessFile(path.join(current_path,file),false);
				});
			}).catch(err => {
				console.error(err);
			});
		} else {
			console.error(current_path + ' is not a file or directory.');
		}
	}).catch(err => {
		console.error(err);
	});
}

function ProcessArgs() {
	var args = new Set(process.argv.slice(2));
	
	//If the help command was given at all, we just do help and quit.
	if(args.has('--help')) {
		PrintHelp();
	}

	//Set variable for dry run.
	if(args.has('-R')) {
		recursive = true;
		args.delete('-R')
	}

	args.forEach(current_arg => {
		ProcessPathArgs(path.resolve(current_arg),true);
	});
}

ProcessArgs();