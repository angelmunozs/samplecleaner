#	Ejecuta el script de limpieza de audio varias veces seguidas para obtener estadísticas
max=20

for ((i = 1; i <= $max; ++i));
do
	echo "Test #$i"
	python scripts/python/clean.py test/dirty/Raphael\ -\ Yo\ soy\ aquel.wav 70 1 20 1
done