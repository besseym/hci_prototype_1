
setwd("/Users/michaelbessey/Education/iastate/HCI_598/hci_prototype/data")

library(ggplot2)

df <- read.table("outlet_count.tsv", header = TRUE, sep = "\t", na.strings=c("null"), stringsAsFactors=F)
head(df)
?read.table


df$OUTLET_NAME <- factor(df$OUTLET_NAME, levels = df$OUTLET_NAME[order(df$VIDEO_COUNT)])

p <- ggplot(df, aes(x=OUTLET_NAME, y=VIDEO_COUNT))
p <- p + geom_bar(stat="identity")
p <- p + coord_flip()
p <- p + theme_bw()
p <- p + theme(legend.key = element_rect(size = 0), panel.border = element_rect(size = 0))
p <- p + labs(x = "Outlet", y = "Distributed Videos")
p

