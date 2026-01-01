require 'pathname'
require 'fileutils'

source_dir = Pathname(__dir__).join('../../elin-chara-viewer')
version = source_dir.join('versions/nightly').read.strip
csv_path = source_dir.join("db/#{version}/elements.csv")

FileUtils.cp(csv_path, Pathname(__dir__).join('../data/elements.csv'))
