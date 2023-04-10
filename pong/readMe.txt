This is a variation on the classic Atari game "Pong," that uses two paddles.
Use left and right; up and down arrow keys to move the paddles.

Rules:
First to seven points wins the round.
First to 3 wins is the match victor.

Issues:
-The ball angle on the horizontal (top and bottom paddles), will reverse if it hits the particular side of the paddle
from which the ball is coming from. The logic here is that the ball ought to angle based on where the paddle hits, and although
this logic is correct, it doesn't take into account the angle from which the ball is coming from.
-Possible fix: Calculate the incoming angle and make check/modify the outgoing angle to be in the opposite vector to keep
the ball traveling in the same general x direction.

-If the ball is traveling too fast, the checkCollision() will not detect it in time and cause a point to be erroneously gained.
-Possible fix: limit the ball speed.

