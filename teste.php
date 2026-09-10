<?php

echo "<h2>Versão do PHP:</h2>";
echo phpversion();

echo "<h2>Drivers PDO:</h2>";
print_r(PDO::getAvailableDrivers());