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

#include <iostream>
#include <filesystem>
#include <functional>
#include <cstring>
#include <vector>
#include <unordered_set>
#include <unordered_map>
#include <libioapp.hpp>

//Globals
bool recursive = false;

std::string RemoveFirstChar(std::string s)
{
	s.erase(s.begin());
	return s;
}

int PrintHelp(void)
{
	std::cerr <<
	"Usage: extsort [options] <dir(s)> <file(s)>\n" <<
	"	-R     | Recursively navigate directories.\n" <<
	"	--help | Print this help.\n\n" <<
	"Example: extsort /user/junk /mnt/stuff/things.txt\n";
	return 1;
}

int main(int argc, char* argv[])
{
	if(argc == 0)
	{
		return PrintHelp();
	}

	ioapp::ProcessArgs extsort_ProcessArgs(argc,argv,true,1);

	for(const std::string &f : extsort_ProcessArgs.Flags)
	{
		if(f == "--help")
		{
			return PrintHelp();
		}

		if(f == "-R")
		{
			recursive = true;
		}
	}

	for(const std::string &arg : extsort_ProcessArgs.Paths)
	{
		ioapp::ioapp(std::filesystem::path(arg), [&](std::filesystem::path p) {
			if(p.has_extension())
			{
				std::string new_subdir = p.parent_path().string() + '/' + RemoveFirstChar(p.extension().string());
				std::string new_file = new_subdir + '/' + p.filename().string();

				//If the subdir we plan to move to exists.
				if(!std::filesystem::is_directory(new_subdir))
				{
					if(std::filesystem::create_directory(new_subdir))
					{
						//We try two methos of moving a file, and crash if they fail.
						try
						{
							std::filesystem::rename(p, new_file);
						}

						catch(const std::exception& e)
						{
							try
							{
								std::filesystem::copy(p, new_file);
								std::filesystem::remove(p);
							}

							catch(const std::exception& ex)
							{
								std::cerr << ex.what() << '\n' << "Failed to move " << p.string() << std::endl;
								exit(1);
							}
						}

						std::cout << "Move: " << p.string() << " -> " << new_file << std::endl;
					}

					else
					{
						std::cerr << "Could not create directory: " << new_subdir << '\n';
						exit(1);
					}
				}
			}
		}, recursive);
	}

	return 0;
}